#!/usr/bin/env python3
"""Run Vite/Vitest with guarded build/cache/tmp/result paths."""
import os
import json
from pathlib import Path
import subprocess
import sys
sys.dont_write_bytecode = True
from build_paths import paths, validate, environment, REPO


def main():
    action, *extra = sys.argv[1:]
    if action not in ('build', 'dev', 'preview', 'test'):
        raise SystemExit('Expected build, dev, preview or test')
    values = paths(task=os.environ.get('BEAD_BUILD_TASK', 'dev'))
    output = validate(os.environ.get('BEAD_VITE_OUT_DIR', values['dist'] / 'site'))
    cache = validate(os.environ.get('BEAD_VITE_CACHE_DIR', values['cache'] / 'vite'))
    results = validate(os.environ.get('BEAD_TEST_RESULTS_DIR', values['tests']))
    # Reject output-affecting CLI flags rather than letting a second spelling or
    # repeated option override the guarded config. Use the validated env knobs.
    forbidden = ('--outDir', '--cacheDir', '--outputFile', '--coverage.reportsDirectory', '--config', '-c', '--root')
    keys = [arg.split('=', 1)[0] for arg in extra]
    if any(key == flag or key.startswith(flag + '.') for key in keys for flag in forbidden) or any(key.startswith('-c') and not key.startswith('--') for key in keys):
        raise SystemExit('Use BEAD_VITE_OUT_DIR / BEAD_VITE_CACHE_DIR / BEAD_TEST_RESULTS_DIR for validated output overrides')
    environment(values)
    results.mkdir(parents=True, exist_ok=True)
    os.environ.update(BEAD_VITE_OUT_DIR=str(output), BEAD_VITE_CACHE_DIR=str(cache), BEAD_TEST_RESULTS_DIR=str(results))
    # Vite's bundled config loader writes beside its config (or into the
    # nearest node_modules/.vite-temp), independently of cacheDir. Load the
    # dependency-free maintained config through an external entry file too.
    config_dir = values['work'] / 'vite-config'
    config_dir.mkdir(parents=True, exist_ok=True)
    config = config_dir / 'vite.config.mjs'
    config.write_text('export { default } from ' + json.dumps(str(REPO / 'vite.config.ts')) + ';\n')
    binary = REPO / 'node_modules/.bin'
    if action == 'build':
        subprocess.run([str(binary / 'tsc'), '--noEmit'], cwd=REPO, check=True)
    tool = 'vitest' if action == 'test' else 'vite'
    args = ['run'] if action == 'test' else [action] if action in ('build', 'preview') else []
    subprocess.run([str(binary / tool), *args, '--config', str(config), *extra], cwd=REPO, check=True)


if __name__ == '__main__':
    main()

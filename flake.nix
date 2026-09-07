{
  description = "Privacy-first browser-based fuse bead pattern generator";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      packages = forAllSystems (system:
        let pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.buildNpmPackage {
            pname = "bead-pattern-studio";
            version = "0.1.0";
            src = self;
            npmDepsHash = "sha256-1M3hBxiscg+/YMH4aitwEYnQaIqDUgQulCQiMYI8rSQ=";
            npmBuildScript = "build";
            installPhase = ''
              runHook preInstall
              cp -r dist $out
              runHook postInstall
            '';
          };
        });

      devShells = forAllSystems (system:
        let pkgs = import nixpkgs { inherit system; };
        in {
          default = pkgs.mkShell {
            packages = [ pkgs.nodejs_24 ];
            shellHook = ''
              echo "Bead Pattern Studio · Node $(node --version)"
              echo "Run: npm ci && npm run dev"
            '';
          };
        });
    };
}

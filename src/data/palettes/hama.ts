import type { BeadColor } from "../../types";

// Community-measured Hama values derived from github.com/cornelk/beadmachine
// (MIT). Screen RGB is an approximation and can differ by batch and lighting.
export const hama: BeadColor[] = [
  ["H1", "White", 255, 255, 255], ["H2", "Cream", 246, 240, 192],
  ["H3", "Yellow", 242, 203, 14], ["H4", "Orange", 205, 74, 28],
  ["H5", "Red", 162, 37, 35], ["H6", "Pink", 214, 140, 155],
  ["H7", "Purple", 88, 65, 137], ["H8", "Blue", 33, 82, 148],
  ["H9", "Light Blue", 11, 113, 185], ["H10", "Green", 46, 120, 59],
  ["H11", "Light Green", 117, 180, 137], ["H12", "Brown", 67, 49, 37],
  ["H17", "Grey", 128, 128, 128], ["H18", "Black", 0, 0, 0],
  ["H20", "Reddish Brown", 121, 60, 44], ["H21", "Light Brown", 184, 131, 89],
  ["H22", "Dark Red", 111, 35, 37], ["H26", "Flesh", 220, 175, 142],
  ["H27", "Beige", 204, 184, 143], ["H28", "Dark Green", 39, 83, 61],
  ["H29", "Claret", 93, 37, 57], ["H30", "Burgundy", 115, 44, 66],
  ["H31", "Turquoise", 38, 154, 157], ["H32", "Fuchsia", 187, 58, 119],
  ["H33", "Cerise", 198, 55, 87], ["H34", "Neon Yellow", 232, 230, 35],
  ["H35", "Neon Red", 245, 61, 71], ["H36", "Neon Blue", 45, 156, 210],
  ["H37", "Neon Green", 73, 198, 95], ["H38", "Neon Orange", 239, 91, 36],
  ["H41", "Pastel Blue", 109, 178, 204], ["H42", "Pastel Green", 139, 196, 132],
  ["H43", "Pastel Yellow", 244, 225, 120], ["H44", "Pastel Red", 232, 112, 121],
  ["H45", "Pastel Purple", 173, 137, 182], ["H46", "Pastel Pink", 238, 170, 190],
  ["H47", "Pastel Green", 159, 206, 166], ["H48", "Pastel Orange", 238, 162, 98],
  ["H70", "Light Grey", 190, 190, 183], ["H71", "Dark Grey", 76, 78, 80],
  ["H75", "Tan", 161, 117, 88], ["H76", "Nougat", 181, 116, 84],
  ["H77", "Light Nougat", 225, 164, 126], ["H78", "Plum", 113, 63, 100],
  ["H79", "Apricot", 239, 151, 116], ["H80", "Light Brown", 194, 146, 112]
].map(([code, name, r, g, b]) => ({
  brand: "Hama", code: String(code), name: String(name),
  rgb: [Number(r), Number(g), Number(b)], enabled: true
}));

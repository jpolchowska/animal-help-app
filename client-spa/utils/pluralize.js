export function pluralizeAnimals(count) {
  if (count === 1) return "zwierzę";
  if (count >= 2 && count <= 4) return "zwierzęta";
  return "zwierząt";
}
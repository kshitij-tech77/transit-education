/** Derives the `/locations/[slug]` URL segment from a `branches.name` value (e.g. "Kathmandu (Head Office)" -> "kathmandu"). */
export function toBranchSlug(name: string): string {
  return name.replace(/ Branch$/i, "").replace(/ \(Head Office\)/i, "").trim().toLowerCase();
}

/**
 * Task Library Translation Helper
 * Maps English task titles from the database to translation keys
 */

export function getTaskLibraryTranslationKey(englishTitle: string): string {
  // Convert title to a translation key format
  // Example: "Make Your Bed" -> "make_your_bed"
  return englishTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function translateLibraryTask(
  englishTitle: string,
  englishDescription: string,
  t: (key: string) => string
): { title: string; description: string } {
  const titleKey = getTaskLibraryTranslationKey(englishTitle)

  // Try to get translated title, fallback to English if not found
  const translatedTitle = t(`taskLibrary.tasks.${titleKey}.title`)
  const translatedDescription = t(`taskLibrary.tasks.${titleKey}.description`)

  // If translation key is returned as-is, it means translation is missing
  // In that case, use the English version
  const title = translatedTitle.startsWith('taskLibrary.tasks.')
    ? englishTitle
    : translatedTitle

  const description = translatedDescription.startsWith('taskLibrary.tasks.')
    ? englishDescription
    : translatedDescription

  return { title, description }
}

import { useState } from 'react'

/**
 * Tracks which item in a list is "selected" (e.g. the row clicked in a table),
 * falling back to the first item if the selected id no longer exists in the list.
 */
export function useSelectableList<T>(items: T[], getId: (item: T) => string) {
  const [selectedId, setSelectedId] = useState(() => getId(items[0]))
  const selected = items.find((item) => getId(item) === selectedId) ?? items[0]

  return { selectedId, setSelectedId, selected }
}

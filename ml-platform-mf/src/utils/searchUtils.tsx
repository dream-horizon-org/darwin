import React from 'react'

export const highlightSearchMatch = (
  text: string,
  searchQuery: string,
  classes: any
): React.ReactNode => {
  if (!searchQuery) return text

  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
  return parts.map((part, index) =>
    part.toLowerCase() === searchQuery.toLowerCase() ? (
      <span key={index} className={classes.highlightSearchMatch}>
        {part}
      </span>
    ) : (
      part
    )
  )
}

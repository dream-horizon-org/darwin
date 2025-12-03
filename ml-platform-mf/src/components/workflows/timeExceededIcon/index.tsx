import React from 'react'

const TimeExceededIcon = ({width = 16, height = 16, fill = '#DB9200'}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox='0 0 14 15'
      fill='none'
    >
      <path
        d='M7 14.5C5.06333 14.5 3.4125 13.8175 2.0475 12.4525C0.682501 11.0875 0 9.43667 0 7.5C0 5.56333 0.682501 3.9125 2.0475 2.5475C3.4125 1.1825 5.06333 0.5 7 0.5C8.93667 0.5 10.5875 1.1825 11.9525 2.5475C13.3175 3.9125 14 5.56333 14 7.5C14 9.43667 13.3175 11.0875 11.9525 12.4525C10.5875 13.8175 8.93667 14.5 7 14.5ZM9.345 10.825L10.325 9.845L7.7 7.22V3.3H6.3V7.78L9.345 10.825Z'
        fill='#DB9200'
      />
    </svg>
  )
}

export default TimeExceededIcon

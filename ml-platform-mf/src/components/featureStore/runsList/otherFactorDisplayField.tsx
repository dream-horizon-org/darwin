import {Tooltip} from '@mui/material'
import React, {useLayoutEffect, useRef, useState} from 'react'

interface IProps {
  name: string
  value: string
  className?: string
}

const paddingDifference = 82

const OtherFactorDisplayField = (props: IProps) => {
  const {name, value, className} = props
  const parentRef = useRef(null)
  const childRef = useRef(null)

  const [parentWidth, setParentWidth] = useState(0)
  const [childWidth, setChildWidth] = useState(0)

  useLayoutEffect(() => {
    setParentWidth(parentRef.current.offsetWidth)
    setChildWidth(childRef.current.offsetWidth)
  }, [])

  const displayToolTip = parentWidth < childWidth + paddingDifference

  return (
    <div className={className} ref={parentRef}>
      <span>{name}</span>
      <Tooltip
        PopperProps={{
          sx: {
            '> div': {
              maxHeight: '200px',
              overflowY: 'auto'
            }
          }
        }}
        title={displayToolTip ? value : ''}
      >
        <span
          style={{maxWidth: `${parentWidth - paddingDifference}px`}}
          ref={childRef}
        >
          {value}
        </span>
      </Tooltip>
    </div>
  )
}

export default OtherFactorDisplayField

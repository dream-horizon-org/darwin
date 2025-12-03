import React, {ReactNode, useState} from 'react'
import {BitThemeWrapper} from '../bit-theme-wrapper/index'
import {
  ToggleButton,
  ToggleButtonType,
  ToggleButtonVariants
} from '../toggle-button/index'
import {Typography} from '../typography/index'
import styles from './composition-wrapper.style'
import {iconMockFunc, themeToggleList} from './utils'

type ToggleComponentProps = {
  mockList: {
    value: string
    text: string
  }[]
  property: string
  handleObject: (prop: string, value: string | boolean) => void
}

const ToggleComponent = ({
  mockList,
  property,
  handleObject
}: ToggleComponentProps) => {
  const [value, setValue] = useState(mockList?.[0]?.value)

  const handleValueChange = (e, currentValue) => {
    if (currentValue !== null) {
      setValue(currentValue)
      handleObject(property, currentValue)
    }
  }

  return (
    <ToggleButton
      list={mockList}
      handleChange={handleValueChange}
      buttonType={ToggleButtonType.STRING}
      currentValue={value}
      variant={ToggleButtonVariants.PRIMARY}
    />
  )
}

type CompositionWrapperProps = {
  component?: (prop) => JSX.Element
  lists?: object | undefined
  children?: ReactNode
  parentStyle?: object
}

const themeWrapper = styles()

export function CompositionWrapper(props: CompositionWrapperProps) {
  iconMockFunc()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const handleThemeChange = (e, themeValue) => {
    if (themeValue !== null) {
      setTheme(themeValue)
    }
  }
  const [propObject, setPropObject] = useState({})

  const handleObject = (prop, value) => {
    setPropObject((preObj) => ({...preObj, [prop]: value}))
  }

  const classes = themeWrapper({theme})
  return (
    <BitThemeWrapper theme={theme}>
      <div className={classes.wrapper}>
        <div className={classes.toggleGroupWrapper}>
          <div className={classes.toggleGroup}>
            <Typography theme={theme}>Theme :</Typography>
            <ToggleButton
              list={themeToggleList}
              handleChange={handleThemeChange}
              buttonType={ToggleButtonType.ICON}
              currentValue={theme}
              variant={ToggleButtonVariants.PRIMARY}
              theme={theme}
            />
          </div>
          {props.lists &&
            Object.keys(props.lists)?.map((key, index) => {
              return (
                <div key={index} className={classes.toggleGroup}>
                  <Typography theme={theme}>{key} :</Typography>
                  <ToggleComponent
                    mockList={props.lists && props.lists[key]}
                    property={key}
                    handleObject={handleObject}
                  />
                </div>
              )
            })}
        </div>

        {props.children && (
          <div style={props.parentStyle}>
            {React.Children.map(props.children, (child: any) => {
              return React.cloneElement(child, {
                ...child?.props,
                ...propObject,
                theme: theme
              })
            })}
          </div>
        )}
        {props.component && props.component({theme: theme, ...propObject})}
      </div>
    </BitThemeWrapper>
  )
}

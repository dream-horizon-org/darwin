import React, {useState} from 'react'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {fieldVariantsList, InputSizetsList, InputStateList} from './constants'
import {Input} from './input'

export const BasicInput = () => {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input label='Label' name='Input' value={value} onChange={handleChange} />
    </CompositionWrapper>
  )
}
BasicInput.compositionName = 'Input'

export const InputWithIcon = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const handelClick = () => {}
  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input
        onClick={handelClick}
        name='Input'
        value={value}
        label='Label'
        onChange={handleChange}
        icon={Icons.ICON_HIGHLIGHT_OFF}
      />
    </CompositionWrapper>
  )
}
InputWithIcon.compositionName = 'Input + Icon'

export const InputErrorWithIcon = () => {
  // this mockFun is used only to get icon (not to be used)
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  const handelClick = () => {}

  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input
        onClick={handelClick}
        name='Input'
        value={value}
        label='Label'
        onChange={handleChange}
        icon={Icons.ICON_HIGHLIGHT_OFF}
        error={value.length > 5}
        assistiveText='length should be less than 5'
      />
    </CompositionWrapper>
  )
}

InputErrorWithIcon.compositionName = 'Error + Assistive text + Icon'

export const InputWithCounter = () => {
  // this mockFun is used only to get icon (not to be used)
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  const handelClick = () => {}

  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input
        onClick={handelClick}
        name='Input'
        value={value}
        label='Label'
        onChange={handleChange}
        icon={Icons.ICON_HIGHLIGHT_OFF}
        assistiveText='This is assistive text '
        counterText={50}
      />
    </CompositionWrapper>
  )
}

InputWithCounter.compositionName = 'Input + Counter'

export const InputWithLabelAsPlaceHolder = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input
        label='Label'
        name='Input'
        value={value}
        onChange={handleChange}
        showLabelAsPlaceHolder={true}
      />
    </CompositionWrapper>
  )
}
InputWithLabelAsPlaceHolder.compositionName = 'Input + Place holder'

export const AutoSaveInput = () => {
  const [value, setValue] = useState('')
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  return (
    <CompositionWrapper
      lists={{
        size: InputSizetsList,
        disabled: InputStateList,
        fieldVariant: fieldVariantsList
      }}
    >
      <Input
        label='Label'
        name='Input'
        value={value || 'Click on the text & start editing...'}
        onChange={handleChange}
        showLabelAsPlaceHolder={true}
        autoSave={true}
      />
    </CompositionWrapper>
  )
}

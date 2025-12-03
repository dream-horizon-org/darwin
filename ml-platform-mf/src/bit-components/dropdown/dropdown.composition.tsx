import React, {useState} from 'react'
import {AvatarSizes} from '../avatar/index'
import {CompositionWrapper} from '../composition-wrapper/index'
import {Icons} from '../icon/index'
import {IconPosition} from '../list-item/list-item-dropdown/index'
import {DropDownSizes, FieldVariants} from './constants'
import {Dropdown} from './dropdown'
import {mockAvatarLInk} from './utils'

export const BasicDropdown = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ]
  const [dropValue, setDropValue] = useState<{label: string; id: number}>()

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: {label: string; id: number}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        menuLists={names}
        label={'menu'}
        disableInput={true}
      />
    </CompositionWrapper>
  )
}
BasicDropdown.compositionName = 'Dropdown'

export const ErrorDropdown = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ]
  const [dropValue, setDropValue] = useState<{label: string; id: number}>()

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: {label: string; id: number}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        menuLists={names}
        label={'menu'}
        error={true}
      />
    </CompositionWrapper>
  )
}

export const HelperTextDropdown = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ]
  const [dropValue, setDropValue] = useState<{label: string; id: number}>()

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: {label: string; id: number}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        menuLists={names}
        assistiveText={'This is an assistive text!'}
        label={'menu'}
      />
    </CompositionWrapper>
  )
}

export const AddNewOption = () => {
  const [names, setNames] = useState([
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ])
  const [dropValue, setDropValue] = useState<
    Array<{label: string; id: number}>
  >([])

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value)
  }

  const handleEnterKeyPressed = (value: {label: string; id: number}) => {
    setNames((prevNames) => [value, ...prevNames])
    setDropValue((prevDropValue) => [...prevDropValue, value])
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        menuLists={names}
        label={'menu'}
        canAddNewOption={true}
        handleEnterKey={handleEnterKeyPressed}
      />
    </CompositionWrapper>
  )
}

export const AddNewOptionAndEmptyOptions = () => {
  const [names, setNames] = useState<{id: number; label: string}[]>([])
  const [dropValue, setDropValue] = useState<
    Array<{label: string; id: number}>
  >([])

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value)
  }

  const handleEnterKeyPressed = (value: {label: string; id: number}) => {
    setNames((prevNames) => [value, ...prevNames])
    setDropValue((prevDropValue) => [...prevDropValue, value])
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        menuLists={names}
        label={'menu'}
        canAddNewOption={true}
        handleEnterKey={handleEnterKeyPressed}
        autoFocus
      />
    </CompositionWrapper>
  )
}
AddNewOptionAndEmptyOptions.compositionName = 'New option + empty option'
export const MultiSelect = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ]
  const [dropValue, setDropValue] = useState<
    Array<{label: string; id: number}>
  >([])

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        menuLists={names}
        label={'menu'}
      />
    </CompositionWrapper>
  )
}

export const MultiSelectIcon = () => {
  const names = [
    {label: 'Oliver Hansen', icon: Icons.ICON_ACCESSIBLE_FORWARD},
    {label: 'Van Henry', icon: Icons.ICON_ACCESSIBLE_FORWARD},
    {label: 'April Tucker', icon: Icons.ICON_ACCESSIBLE_FORWARD}
  ]
  const [dropValue, setDropValue] = React.useState<
    Array<{label: string; id: number}>
  >([])

  const newChangeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={newChangeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        isListWithIcon={true}
        menuLists={names}
        label={'menu'}
      />
    </CompositionWrapper>
  )
}

export const ListItemImage = () => {
  const names = [
    {label: 'Oliver Hansen', icon: Icons.ICON_ACCESSIBLE_FORWARD, id: 1},
    {label: 'Van Henry', icon: Icons.ICON_ACCESSIBLE_FORWARD, id: 2},
    {label: 'April Tucker', icon: Icons.ICON_ACCESSIBLE_FORWARD, id: 3}
  ]

  const [dropValue, setDropValue] = useState<
    {label: string; id: number} | {label: string; id: number; icon: Icons}
  >()
  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | {label: string; id: number}
      | {label: string; id: number; icon: Icons}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={changeValue}
        dropDownValue={dropValue}
        isListWithIcon={true}
        menuLists={names}
        label={'menu'}
      />
    </CompositionWrapper>
  )
}

export const ListItemIconOnLeft = () => {
  const names = [
    {
      label: 'Oliver Hansen',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 1
    },
    {
      label: 'Van Henry',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 2
    },
    {
      label: 'April Tucker',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 3
    }
  ]

  const [dropValue, setDropValue] = useState<
    {label: string; id: number} | {label: string; id: number; icon: Icons}
  >()
  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | {label: string; id: number}
      | {label: string; id: number; icon: Icons}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={changeValue}
        dropDownValue={dropValue}
        isListWithIcon={true}
        menuLists={names}
        label={'menu'}
        iconPosition={IconPosition.LEFT}
      />
    </CompositionWrapper>
  )
}

export const MultisSelectDropdownWithCheckbox = () => {
  const names = [
    {
      label: 'Oliver Hansen',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 1
    },
    {
      label: 'Van Henry',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 2
    },
    {
      label: 'April Tucker',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 3
    }
  ]

  const [dropValue, setDropValue] = useState<
    {label: string; id: number} | {label: string; id: number; icon: Icons}
  >()
  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | {label: string; id: number}
      | {label: string; id: number; icon: Icons}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={changeValue}
        dropDownValue={dropValue}
        isListWithIcon={false}
        menuLists={names}
        label={'menu'}
        iconPosition={IconPosition.LEFT}
        renderOptionCheckBox={true}
        isMultipleSelection={true}
      />
    </CompositionWrapper>
  )
}

MultisSelectDropdownWithCheckbox.compositionName = 'Multiselet + checkbox'

export const Avatar = () => {
  const names = [
    {
      label: 'Oliver Hansen',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 1,
      secondaryText: 'SecondaryText',
      avatarSrc: mockAvatarLInk
    },
    {
      label: 'Van Henry',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 2,
      secondaryText: 'SecondaryText',
      avatarSrc: mockAvatarLInk
    },
    {
      label: 'April Tucker',
      icon: Icons.ICON_ACCESSIBLE_FORWARD,
      id: 3,
      secondaryText: 'SecondaryText',
      avatarSrc: mockAvatarLInk,
      hasPermission: false,
      tertiaryText: 'No Access'
    }
  ]

  const [dropValue, setDropValue] = useState<
    | {label: string; id: number}
    | {label: string; id: number; icon: Icons; secondaryText: string}
  >()
  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | {label: string; id: number}
      | {label: string; id: number; icon: Icons; secondaryText: string}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={changeValue}
        dropDownValue={dropValue}
        isListWithIcon={true}
        menuLists={names}
        label={'menu'}
        iconPosition={IconPosition.LEFT}
        getOptionDisabled={(option) => option?.id === 3}
      />
    </CompositionWrapper>
  )
}

export const AvatarText = () => {
  const names = [
    {
      label: 'Oliver Hansen',
      id: 1,
      secondaryText: 'SecondaryText',
      avatarText: 'Oliver Hansen',
      avatarSize: AvatarSizes.MINI
    },
    {
      label: 'Van Henry',
      id: 2,
      secondaryText: 'SecondaryText',
      avatarText: 'Van Henry',
      avatarSize: AvatarSizes.MINI
    },
    {
      label: 'April Tucker',
      id: 3,
      secondaryText: 'SecondaryText',
      avatarText: 'April Tucker',
      avatarSize: AvatarSizes.MINI
    }
  ]

  const [dropValue, setDropValue] = useState<
    | {label: string; id: number}
    | {label: string; id: number; icon: Icons; secondaryText: string}
  >()
  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | {label: string; id: number}
      | {label: string; id: number; icon: Icons; secondaryText: string}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        size={DropDownSizes.Small}
        onChange={changeValue}
        dropDownValue={dropValue}
        isListWithIcon={true}
        menuLists={names}
        label={'menu'}
        isMultipleSelection={true}
        iconPosition={IconPosition.LEFT}
      />
    </CompositionWrapper>
  )
}

export const LimitTags = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2},
    {label: 'Bruce banner', id: 3},
    {label: 'Bruce wayne', id: 4},
    {label: 'Clark kent', id: 5},
    {label: 'Tony Stark', id: 6},
    {label: 'Steve rogers', id: 7},
    {label: 'Homelander', id: 8},
    {label: 'Invinicible', id: 9}
  ]
  const [dropValue, setDropValue] = useState<
    Array<{label: string; id: number}>
  >([])

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: Array<{label: string; id: number}>
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        isMultipleSelection={true}
        menuLists={names}
        label={'menu'}
        limitTags={3}
      />
    </CompositionWrapper>
  )
}

export const dropdownWithStartAdornment = () => {
  const names = [
    {label: 'Oliver Hansen', id: 1},
    {label: 'Van Henry', id: 2}
  ]
  const [dropValue, setDropValue] = useState<{label: string; id: number}>()

  const changeValue = (
    event: React.SyntheticEvent<Element, Event>,
    value: {label: string; id: number}
  ) => {
    setDropValue(value)
  }

  return (
    <CompositionWrapper>
      <Dropdown
        onChange={changeValue}
        dropDownValue={dropValue}
        menuLists={names}
        label={'menu'}
        fieldVariant={FieldVariants.STANDARD}
        startAdornment={Icons.ICON_ACCESSIBILITY}
      />
    </CompositionWrapper>
  )
}
dropdownWithStartAdornment.compositionName = 'dropdown + StartIcons'

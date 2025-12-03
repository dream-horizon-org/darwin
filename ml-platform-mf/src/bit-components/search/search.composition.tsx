import React, {useState} from 'react'
import {Search} from './search'

import config from 'config'
import {Chip, ChipSizes} from '../chip/index'
import {CompositionWrapper} from '../composition-wrapper/index'

const iconMockFun = () => {
  const head = document.getElementsByTagName('HEAD')[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}
const arr = [
  {value: 1, text: 'one '},
  {value: 2, text: 'two'},
  {value: 3, text: 'three'}
]

export const BasicSearch = () => {
  iconMockFun()
  const [searchByValue, setSearchByValue] = useState('')
  const onSearch = (value) => {
    setSearchByValue(value)
  }
  return (
    <CompositionWrapper>
      <Search
        onSearch={onSearch}
        searchByValue={searchByValue}
        autoComplete='off'
      />
    </CompositionWrapper>
  )
}

export const SearchWithOptions = () => {
  iconMockFun()
  const [searchByValue, setSearchByValue] = useState('')
  const onSearch = () => {}
  const serachBy = (value) => {
    setSearchByValue(value)
  }
  return (
    <CompositionWrapper>
      <Search
        onSearch={onSearch}
        searchByOptions={arr}
        onChangeForSearchBy={serachBy}
        searchByValue={searchByValue}
        autoComplete='off'
      />
    </CompositionWrapper>
  )
}

const films = [
  {id: 1, value: {label: 'The Shawshank Redemption', year: 1994}},
  {id: 2, value: {label: 'The Godfather', year: 1972}},
  {id: 3, value: {label: 'The Godfather: Part II', year: 1974}},
  {id: 4, value: {label: 'The Dark Knight', year: 2008}},
  {id: 5, value: {label: '12 Angry Men', year: 1957}},
  {id: 6, value: {label: "Schindler's List", year: 1993}},
  {id: 7, value: {label: 'Pulp Fiction', year: 1994}}
]

const renderList = ({listItems, ...rest}) => {
  const {setText, setIsFocused, theme} = rest
  return (
    <React.Fragment>
      {listItems.map((item) => {
        return (
          <div key={item.id} style={{margin: '8px 12px', width: '100%'}}>
            <Chip
              theme={theme}
              size={ChipSizes.Medium}
              label={item.value.label}
              onClick={() => {
                setText(item.value.label)
                setIsFocused(false)
              }}
            />
          </div>
        )
      })}
    </React.Fragment>
  )
}

export const AutocompleteSearch = () => {
  iconMockFun()
  const [listItems, setListItems] = useState(films)
  const onAutoSearchChange = (text: string) => {
    const val = films.filter((film) => film.value.label.includes(text))
    setListItems(val)
  }
  const onSearch = () => {}

  return (
    <CompositionWrapper>
      <Search
        autoSearch
        onSearch={onSearch}
        renderList={renderList}
        showAutoSearchList={true}
        listItems={listItems}
        onAutoSearchChange={onAutoSearchChange}
        noOptionsText={'No options'}
        autoComplete='off'
      />
    </CompositionWrapper>
  )
}

export const AutocompleteSearchWithOptions = () => {
  iconMockFun()
  const [searchByValue, setSearchByValue] = useState('')
  const [listItems, setListItems] = useState(films)
  const onAutoSearchChange = (text: string) => {
    const val = films.filter((film) => film.value.label.includes(text))
    setListItems(val)
  }
  const onSearch = () => {}
  const serachBy = (value) => {
    setSearchByValue(value)
  }
  return (
    <CompositionWrapper>
      <Search
        onSearch={onSearch}
        searchByOptions={arr}
        onChangeForSearchBy={serachBy}
        searchByValue={searchByValue}
        autoSearch
        showAutoSearchList={true}
        renderList={renderList}
        listItems={listItems}
        onAutoSearchChange={onAutoSearchChange}
        noOptionsText={'No options'}
        autoComplete='off'
      />
    </CompositionWrapper>
  )
}

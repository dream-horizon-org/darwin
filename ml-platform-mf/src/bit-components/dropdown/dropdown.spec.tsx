import {getByRole, render, screen, waitFor} from '@testing-library/react'
import UserEvent from '@testing-library/user-event'
import React from 'react'
import {Dropdown} from './dropdown'
const names = [
  {label: 'Oliver Hansen', id: 1},
  {label: 'Van Henry', id: 2}
]

describe('Dropdown Component tests', () => {
  test('dropdown component should render', async () => {
    const mock = jest.fn()
    render(
      <Dropdown
        dropDownValue={{label: 'Oliver Hansen', id: 1}}
        onChange={mock}
        label='Input'
        menuLists={names}
      />
    )
    UserEvent.click(getByRole(screen.getByTestId('dropdown'), 'button'))
    await waitFor(() => UserEvent.click(screen.getByText(/Oliver Hansen/i)))
    const input = (
      screen.getByDisplayValue(/Oliver Hansen/i) as HTMLInputElement
    ).value
    expect(input).toEqual('Oliver Hansen')
  })
})

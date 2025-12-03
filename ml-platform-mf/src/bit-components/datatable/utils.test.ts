import {table as tableTheme} from '../design-tokens/index'
import {hexToRGB, isSelected} from './utils'

describe('datatable', () => {
  describe('should check hex to rgba converter', () => {
    it('test hex to rgba converter', () => {
      const table = tableTheme('dark')
      const hexColorCode = hexToRGB(
        table.table.table_cell.ds_table_cell_container_hover_background_color,
        table.ds_table_cell_container_hover_background_opacity
      )
      expect(hexColorCode).toEqual('rgba(51, 51, 51, 0.1)')
    })
  })
  describe('should check if row is selected', () => {
    it('test to check is row is selected', () => {
      const isSelectedRow = isSelected(333, true, [], [333])
      expect(isSelectedRow).toBe(true)
    })
    it('test to check if selected row is not selected', () => {
      const isSelectedRow = isSelected(4, true, [], [333])
      expect(isSelectedRow).toBe(false)
    })
  })
})

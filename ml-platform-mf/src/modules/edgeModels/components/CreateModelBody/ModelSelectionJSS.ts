import createStyles from '@mui/styles/createStyles'

const styles = () =>
  createStyles({
    container: {
      width: 1088,
      marginLeft: 244,
      border: '1px solid #333333',
      borderRadius: 8,
      marginTop: 48
    },
    modalContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 800,
      border: '2px solid inherit',
      boxShadow: '24',
      backgroundColor: '#121212',
      padding: 24
    },
    sectionWrapper: {
      width: 1088
    },
    modelSection: {
      width: 'auto',
      border: '1px solid #333333',
      borderRadius: 8,
      marginTop: 24,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 32,
      '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline':
        {
          borderColor: '#333333'
        }
    },
    section: {
      width: 'auto',
      border: '1px solid #333333',
      borderRadius: 8,
      marginTop: 24,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 12
    },
    eventTableSectionHeader: {
      display: 'flex',
      height: '20px',
      width: '1048px',
      marginTop: '20px',
      alignItems: 'center',
      gap: '10px'
    },
    addButton: {
      textTransform: 'none',
      padding: '4px 12px 4px 8px',
      '& .MuiButton-startIcon': {
        marginRight: '4px'
      }
    },
    tableCell: {
      borderRight: '1px solid #333333',
      borderBottom: '1px solid #333333'
    },
    accordianHeaderLeft: {
      display: 'flex',
      justifyContent: 'space-between',
      flexGrow: 1
    },
    accordianHeaderRight: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '50%',
      gap: '40px',
      marginLeft: '16px'
    },
    accordianHeaderRightitem: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    },
    compatibleServiceContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    rowWrapper: {
      marginBottom: '8px',
      marginTop: '16px'
    },
    compatibleServiceDropdown: {
      width: '47%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '8px',
      border: '1px solid #8F8F8F',
      '& .MuiOutlinedInput-root': {
        height: '30px',
        '& fieldset': {
          border: '0px'
        },
        '&.Mui-disabled fieldset': {
          border: '0px'
        }
      },
      '& .MuiAutocomplete-root': {
        width: '100%',
        boxSizing: 'border-box'
      },
      '& .MuiFormHelperText-root': {
        display: 'none'
      },
      '& input': {
        marginTop: -4
      }
    },
    compatibleServiceDropdownDisabled: {
      width: '47%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '8px',
      '& .MuiOutlinedInput-root': {
        height: '30px',
        '&.Mui-disabled fieldset': {
          border: '0px'
        }
      },
      '& .MuiAutocomplete-root': {
        width: '100%'
      },
      '& .MuiFormHelperText-root': {
        display: 'none'
      },
      border: '1px solid #8F8F8F',
      borderLeft: '0px',
      borderRight: '0px',
      '& input': {
        marginTop: -4
      }
    },
    compatibleServiceDelete: {
      width: '6%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      height: '48px',
      border: '1px solid #8F8F8F'
    },
    modelSelectionDropdown: {
      width: '49%'
    },
    modelSelectionDropdownDisabled: {
      width: '49%',
      '& fieldset': {
        borderColor: '#333333 !important'
      }
    },
    eventTableHeading: {
      color: '#D9D9D9',
      height: '20px'
    },
    eventTableSectionMargin: {
      marginBottom: '0px'
    },
    propTableBox: {
      width: '100%'
    },
    propTablePaper: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: 0
    },
    propTableContainer: {
      maxHeight: 600
    }
  })

export default styles

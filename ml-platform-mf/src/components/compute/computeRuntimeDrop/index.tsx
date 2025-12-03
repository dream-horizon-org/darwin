// import {Autocomplete, Box, Popper, styled, TextField} from '@mui/material'
// import {withStyles, WithStyles} from '@mui/styles'
// import React, {useCallback, useEffect, useState} from 'react'
// import {UseFormSetValue} from 'react-hook-form'
// import {connect} from 'react-redux'
// import {compose} from 'redux'
// import {CommonState} from '../../../reducers/commonReducer'
// import {
//   IComputeFormData,
//   IDropdownList
// } from '../../../types/compute/common.type'
// import styles, {inputStyles} from './indexJSS'

// interface IOptionLabel {
//   name: string
//   created_by: string
// }
// interface IOption {
//   id: number
//   label: IOptionLabel
//   value: string
// }

// interface IProps extends WithStyles<typeof styles> {
//   clusterCpuRuntimeList: IOption[]
//   clusterGpuRuntimeList: IOption[]
//   clusterCustomRuntimeList: IOption[]
//   clusterOthersRuntimeList: IOption[]
//   onChange: (value: IDropdownList<string>) => void
//   dropDownValue: IDropdownList<string>
//   error: string
//   assistiveText: string
//   onBlur: () => void
//   setValue: UseFormSetValue<IComputeFormData>
//   disabled: boolean
// }

// enum runtimeEnv {
//   CPU = 'CPU',
//   GPU = 'GPU',
//   CUSTOM = 'CUSTOM',
//   OTHERS = 'OTHERS'
// }

// const StyledPopper = styled(Popper)({
//   background: '#333333e6'
// })

// const ComputeRuntimeDrop = (props: IProps) => {
//   const {
//     classes,
//     clusterCpuRuntimeList = [],
//     clusterGpuRuntimeList = [],
//     clusterCustomRuntimeList = [],
//     clusterOthersRuntimeList = [],
//     onChange,
//     dropDownValue,
//     error,
//     assistiveText,
//     onBlur,
//     setValue,
//     disabled = false
//   } = props
//   // const [selectedRuntime, setSelectedRuntime] = useState<IDropdownList<string>>(null)
//   const [selectedEnv, setSelectedEnv] = useState<runtimeEnv>(runtimeEnv.CPU)
//   const totalOptions = [
//     ...clusterCpuRuntimeList,
//     ...clusterGpuRuntimeList,
//     ...clusterCustomRuntimeList,
//     ...clusterOthersRuntimeList
//   ]

//   const getOptions = (selectedEnv) => {
//     const options: IDropdownList<string>[] = [
//       {id: -1, label: '', value: '', type: ''},
//       ...(selectedEnv === runtimeEnv.CPU &&
//         clusterCpuRuntimeList.map((item) => ({
//           ...item,
//           type: 'cpu',
//           label: item.label.name
//         }))),
//       ...(selectedEnv === runtimeEnv.GPU &&
//         clusterGpuRuntimeList.map((item) => ({
//           ...item,
//           type: 'gpu',
//           label: item.label.name
//         }))),
//       ...(selectedEnv === runtimeEnv.CUSTOM &&
//         clusterCustomRuntimeList.map((item) => ({
//           ...item,
//           type: 'custom',
//           label: item.label.name
//         }))),
//       ...(selectedEnv === runtimeEnv.OTHERS &&
//         clusterOthersRuntimeList.map((item) => ({
//           ...item,
//           type: 'others',
//           label: item.label.name
//         })))
//     ]
//     return options
//   }

//   const getCreatedByName = useCallback(
//     (value) => {
//       const option = totalOptions.find((op) => op.value === value)
//       if (option) {
//         return option.label.created_by
//       }
//       return null
//     },
//     [
//       selectedEnv,
//       clusterCpuRuntimeList,
//       clusterGpuRuntimeList,
//       clusterCustomRuntimeList,
//       clusterOthersRuntimeList
//     ]
//   )

//   const getEnvForRuntime = (dropDownValue) => {
//     const runtimeEnvironment = {}

//     const runtimeLists = [
//       {list: clusterCpuRuntimeList, env: runtimeEnv.CPU},
//       {list: clusterGpuRuntimeList, env: runtimeEnv.GPU},
//       {list: clusterCustomRuntimeList, env: runtimeEnv.CUSTOM},
//       {list: clusterOthersRuntimeList, env: runtimeEnv.OTHERS}
//     ]
//     if (dropDownValue) {
//       runtimeLists.forEach(({list, env}) => {
//         list.forEach((item) => {
//           runtimeEnvironment[item.value] = env
//         })
//       })
//     }
//     return dropDownValue
//       ? runtimeEnvironment[dropDownValue.value]
//       : runtimeEnv.CPU
//   }

//   useEffect(() => {
//     if (
//       dropDownValue &&
//       (dropDownValue.type === undefined || dropDownValue.type == null) &&
//       totalOptions.length > 0
//     ) {
//       const env = getEnvForRuntime(dropDownValue)

//       const newDefaultDropdownValue = getOptions(env).find(
//         (o) => o.value === dropDownValue.value
//       )

//       setValue('runtime', newDefaultDropdownValue)
//       setSelectedEnv(env)
//     }
//   }, [dropDownValue])

//   return (
//     <Autocomplete
//       disabled={disabled}
//       onChange={(ev, val: IDropdownList<string>) => onChange(val)}
//       value={dropDownValue}
//       disablePortal={true}
//       className={classes.customAutocomplete}
//       id='runtime-select'
//       options={totalOptions.length > 0 ? getOptions(selectedEnv) : []}
//       autoHighlight
//       getOptionLabel={(option: IDropdownList<string>) => option.label}
//       noOptionsText={
//         <div className={classes.noOptionBox}>
//           {totalOptions.length <= 0 ? <div>Loading...</div> : ''}
//         </div>
//       }
//       renderOption={(props, option, state) => (
//         <>
//           <Box
//             component='li'
//             sx={{padding: option.id === -1 ? '4px' : '4px !important'}}
//             {...props}
//           >
//             {option.id === -1 ? (
//               <div
//                 className={classes.runtimeTabs}
//                 onClick={(ev) => {
//                   ev.stopPropagation()
//                   ev.preventDefault()
//                 }}
//               >
//                 <div
//                   className={`${classes.runtimeTabDiv} ${
//                     selectedEnv === runtimeEnv.CPU
//                       ? classes.runtimeTabDivActive
//                       : ''
//                   }`}
//                   onClick={(ev) => {
//                     setSelectedEnv(runtimeEnv.CPU)
//                   }}
//                 >
//                   CPU
//                   <span
//                     className={`${classes.runtimeTabSpan} ${
//                       selectedEnv === runtimeEnv.CPU
//                         ? classes.runtimeTabSpanActive
//                         : ''
//                     }`}
//                   >
//                     {clusterCpuRuntimeList.length}
//                   </span>
//                 </div>
//                 <div
//                   className={`${classes.runtimeTabDiv} ${
//                     selectedEnv === runtimeEnv.GPU
//                       ? classes.runtimeTabDivActive
//                       : ''
//                   }`}
//                   onClick={(ev) => {
//                     setSelectedEnv(runtimeEnv.GPU)
//                   }}
//                 >
//                   GPU
//                   <span
//                     className={`${classes.runtimeTabSpan} ${
//                       selectedEnv === runtimeEnv.GPU
//                         ? classes.runtimeTabSpanActive
//                         : ''
//                     }`}
//                   >
//                     {clusterGpuRuntimeList.length}
//                   </span>
//                 </div>
//                 <div
//                   className={`${classes.runtimeTabDiv} ${
//                     selectedEnv === runtimeEnv.CUSTOM
//                       ? classes.runtimeTabDivActive
//                       : ''
//                   }`}
//                   onClick={(ev) => {
//                     setSelectedEnv(runtimeEnv.CUSTOM)
//                   }}
//                 >
//                   CUSTOM
//                   <span
//                     className={`${classes.runtimeTabSpan} ${
//                       selectedEnv === runtimeEnv.CUSTOM
//                         ? classes.runtimeTabSpanActive
//                         : ''
//                     }`}
//                   >
//                     {clusterCustomRuntimeList.length}
//                   </span>
//                 </div>
//                 <div
//                   className={`${classes.runtimeTabDiv} ${
//                     selectedEnv === runtimeEnv.OTHERS
//                       ? classes.runtimeTabDivActive
//                       : ''
//                   }`}
//                   onClick={(ev) => {
//                     setSelectedEnv(runtimeEnv.OTHERS)
//                   }}
//                 >
//                   OTHERS
//                   <span
//                     className={`${classes.runtimeTabSpan} ${
//                       selectedEnv === runtimeEnv.OTHERS
//                         ? classes.runtimeTabSpanActive
//                         : ''
//                     }`}
//                   >
//                     {clusterOthersRuntimeList.length}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className={classes.dropdownLiItemContainer}>
//                 <div className={classes.dropdownLiName}>{option.label}</div>
//                 <div className={classes.dropdownLiCreatedBy}>
//                   By: {getCreatedByName(option.value)}
//                 </div>
//               </div>
//             )}
//           </Box>
//           {getOptions(selectedEnv).filter((op) => op.id !== -1).length === 0 ? (
//             <Box component='li' sx={{padding: '4px !important'}} {...props}>
//               <div
//                 className={classes.dropdownLiItemPlaceHolder}
//                 onClick={(ev) => {
//                   ev.stopPropagation()
//                   ev.preventDefault()
//                 }}
//               >
//                 No options Available!
//               </div>
//             </Box>
//           ) : null}
//         </>
//       )}
//       renderInput={(params) => {
//         return (
//           <div>
//             <TextField
//               {...params}
//               disabled={disabled}
//               onBlur={() => onBlur()}
//               error={Boolean(error)}
//               sx={inputStyles}
//               className={classes.customTextField}
//               label={'Runtime'}
//               inputProps={{
//                 ...params.inputProps,
//                 autoComplete: 'off' // disable autocomplete and autofill
//               }}
//               helperText={Boolean(error) && assistiveText}
//             />
//           </div>
//         )
//       }}
//     />
//   )
// }
// const mapStateToProps = (state: CommonState) => ({})

// const mapDispatchToProps = (dispatch) => {
//   return {}
// }

// const styleComponent = compose(
//   withStyles(styles, {withTheme: true}),
//   connect(mapStateToProps, mapDispatchToProps)
// )(ComputeRuntimeDrop)

// export default styleComponent

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import {WithStyles, withStyles} from '@mui/styles'
import React, {useEffect, useMemo, useRef} from 'react'
import {aliasTokens} from '../../../../../theme.contants'
import styles from './filePickerJSS'
interface IProps extends WithStyles<typeof styles> {
  name: string
  buttonText: string
  file: File | null
  onFileChange: (file: File) => void
  accept?: string
  errorOptions?: {
    errorMessage?: string
    showError?: boolean
  }
  fileSizeType: 'MB' | 'KB' | 'GB'
  dataTestId?: string
}

const FilePicker = (props: IProps) => {
  const {
    classes,
    file,
    onFileChange,
    name,
    accept,
    buttonText,
    errorOptions,
    fileSizeType,
    dataTestId
  } = props

  const fileSize = useMemo(() => {
    if (file) {
      if (fileSizeType === 'KB') {
        return file.size / 1000
      } else if (fileSizeType === 'MB') {
        return file.size / 1000000
      }
      return file.size / 1000000000
    }
  }, [file, fileSizeType])

  return (
    <div className={classes.container}>
      <div
        className={classes.fileInputContainer}
        style={{
          borderColor: errorOptions?.errorMessage
            ? aliasTokens.error_border_color
            : aliasTokens.default_border_color
        }}
      >
        {!file ? (
          <div className={classes.fileInputEmptyContainer}>
            <CloudUploadOutlinedIcon className={classes.fileInputEmptyIcon} />
            <p className={classes.fileInputEmptyInstruction}>
              Drag and drop the file here
            </p>
            <h3 className={classes.fileInputEmptyButton}>{buttonText}</h3>
          </div>
        ) : (
          <div className={classes.fileInputNonEmptyContainer}>
            <div className={classes.imageContainer}>
              <InsertDriveFileOutlinedIcon className={classes.image} />
            </div>
            <div className={classes.fileInputNonEmptyContentContainer}>
              <h3 className={classes.fileInputNonEmptyFileName}>
                {file?.name}
              </h3>
              <p className={classes.fileInputNonEmptyFileSize}>
                {fileSize} {fileSizeType}
              </p>
            </div>
          </div>
        )}
        <input
          required
          type='file'
          id='file'
          className={classes.fileInput}
          name={name}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onChange={(e) => {
            if (e.target.files) {
              onFileChange(e.target.files[0])
            }
          }}
          accept={accept}
          data-testid={dataTestId}
        />
      </div>
      {errorOptions?.showError && errorOptions?.errorMessage && (
        <p className={classes.errorMessage}>{errorOptions?.errorMessage}</p>
      )}
      {file && (
        <DeleteOutlineOutlinedIcon
          className={classes.fileInputNonEmptyDeleteIcon}
          onClick={() => {
            onFileChange(null)
          }}
        />
      )}
    </div>
  )
}

const StyledComponent = withStyles(styles, {withTheme: true})(FilePicker)

export default StyledComponent

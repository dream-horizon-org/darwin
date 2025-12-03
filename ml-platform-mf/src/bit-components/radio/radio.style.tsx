import {createUseStyles} from 'react-jss'

export default createUseStyles({
  radioProps: (props: {minWidth}) => ({
    minWidth: props.minWidth + 'px'
  })
})

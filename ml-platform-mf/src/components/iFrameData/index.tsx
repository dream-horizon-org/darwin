import React, {useEffect} from 'react'

interface IProps {}

const iFrameData = (props: IProps): JSX.Element => {
  useEffect(() => {
    document.location.href =
      'http://internal-ad8df408f94604fb9aa8abb6fb3bd79f-528899174.us-east-1.elb.amazonaws.com:8888/'
  }, [])
  return <div>hello</div>
}

export default iFrameData

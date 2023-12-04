import React from 'react'
import { Header } from 'semantic-ui-react'

// Header of sections in the Create Recipe page
const SectionHeader = (props) => (
    <Header
        as='h3' block>
        {props.text}
    </Header>
)

export default SectionHeader
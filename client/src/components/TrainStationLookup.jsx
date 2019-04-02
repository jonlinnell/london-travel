import React, { PureComponent, Fragment } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { get } from 'lodash'

import Row from './Row'
import Input from './Input'

import { lighten } from '../lib/colours'

const { API } = process.env

const autocompleteId = 'autocomplete-stations'

const Autocomplete = styled.div`
  position: absolute;
  bottom: 96px;
  right: 12px;

  margin: 0;

  z-index: 2;
`

const StationList = styled.ul`
  color: white;

  list-style: none;
  padding: 0;

  & > :nth-child(odd) {
    background-color: ${({ theme: { colours } }) => colours.rail.colour};
  }

  & > :nth-child(even) {
    background-color: ${({ theme: { colours } }) => lighten(colours.rail.colour, 50)};
  }
`

const Station = styled.li`
  padding: 6px;
  font-size: 0.9rem;
`

class TrainStationLookup extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      hasError: false,
      error: null,
      data: [],
      searchString: '',
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  timeoutId = null

  triggerFetch = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.timeoutId = setTimeout(() => this.fetchData(), 500)
  }

  fetchData = () => {
    const { searchString } = this.state

    this.setState(prevState => ({ ...prevState, loading: true }))

    axios.get(`${API}/searchStations/${searchString}`).then(response => {
      document.getElementById(autocompleteId).scrollIntoView()
      this.setState({ data: response.data })
    })
  }

  handleKeyPress = e => {
    const { searchString } = this.state

    if (e.keyCode === 8 && searchString.length > 2) {
      this.triggerFetch()
    }
  }

  handleChange = e => {
    this.setState({ searchString: e.target.value }, () => {
      const { searchString } = this.state
      const { onClear } = this.props

      if (searchString.length > 2) {
        this.triggerFetch()
      } else if (!searchString) {
        this.setState({ data: [] })
        onClear()
      }
    })
  }

  render() {
    const { searchString, data } = this.state
    const { disabled, onSubmit, label } = this.props

    return (
      <Fragment>
        <Autocomplete id={autocompleteId}>
          <StationList pose={searchString.length > 2 ? 'enter' : 'exit'}>
            {data.slice(0, 10).map(station => (
              <Station
                key={get(station, 'crs', 1)}
                onClick={() =>
                  this.setState(
                    {
                      data: [],
                      searchString: station.name,
                    },
                    () => onSubmit(station.crs)
                  )
                }
              >
                {get(station, 'name', '')}
              </Station>
            ))}
          </StationList>
        </Autocomplete>
        <Row>
          <Input
            type="text"
            placeholder={label}
            value={searchString}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyPress}
            onFocus={this.clearData}
            disabled={disabled}
          />
        </Row>
      </Fragment>
    )
  }
}

export default TrainStationLookup

import React from 'react'
import renderer from 'react-test-renderer'
import Hello from '@/components/Hello/Hello'

describe('hello', () => {
  test('example jest with ts', () => {
    const component = renderer.create(<Hello />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})

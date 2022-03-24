# Reflex, a tiny React

For learning purposes, I challenged myself to write a working React version with its minimal functionalities. It isn't necessarily an inspiration of the current state of affairs used in React.

Current state of affairs it supports:

- JSX elements (thanks, `tsc`)
- Functional components
- Reactivity through `useState` and broadcasted through props

Biggest caveats that are still being worked on:

- Improve the reconciler algorithm –– right now is a full tree re-render at any state change
- Improve re-render API –– right now it relies on raw JSX parsing and execution to re-render
- Support for useEffect
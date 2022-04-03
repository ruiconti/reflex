# Reflex, a tiny React

For learning purposes, I challenged myself to write a working React version with its minimal functionalities. It wasn't an inspiration/copy of the current algorithms and decisions that are used in production React. Modus-operandi is: map API surface and behavior, implement myself here, and later contrast with production React's implementations. The idea is to slowly converge to those, as mistakes are made.

## Features 

Current state of affairs it supports:

- JSX elements (thanks, `tsc`)
- Functional components
- Reactivity through `useState` and propagated through props
- Reconciles and re-paints only the sub-tree that had state changes

An example app is located at `src/App.tsx`.

## To-do list

Biggest caveats that should be solved for the scope of this project:

- [x] Improve re-render API –– right now it relies on raw JSX parsing and execution to re-render
- [x] Improve the reconciler algorithm –– right now is a full tree re-render at any state change
- Maintain a clear state between re-renders as to not break interactivity e.g. maintain focus state
- Synchronize the paints with the browser
- Support for useEffect
- Support for useRef 
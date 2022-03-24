# Reflex, a tiny React

For learning purposes, I challenged myself to write a working React version with its minimal functionalities. It wasn't an inspiration/copy of the current algorithms and decisions that are used in production React. Modus-operandi is: map API surface and behavior, implement myself here, and later contrast with production React's implementations. The idea is to slowly converge to those, as mistakes are made.

## Features 

Current state of affairs it supports:

- JSX elements (thanks, `tsc`)
- Functional components
- Reactivity through `useState` and broadcasted through props

An example app is located at `src/App.tsx`.

## Still missing

Biggest caveats that should be solved for the scope of this project:

- Improve re-render API –– right now it relies on raw JSX parsing and execution to re-render
- Improve the reconciler algorithm –– right now is a full tree re-render at any state change
- Support for useEffect
- Support for useRef 
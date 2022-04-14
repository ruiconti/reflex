<h2 align="center">
Reflex, a tiny react

⚛️ 🤏
</h2>

For learning purposes, I challenged myself to write a small, naive, but working react. With its core functionalities.

The goal is to gradually, on my own, slowly converge to the design that is used in React's production code. Of course, with big constraints to make it feasible.

## Features 

The end goal is to provide a useful, but not optimized reactivity library.

Currently features:

- Support for JSX
- Support for functional components
- State and reactivity provided by `useState` hook and props propagation
- Efficient scheduling by delegating control back to main thread on fixed intervals

## Running

As simple as a

```sh
yarn dev
```

An example app is located at `src/App.tsx`.


## Upcoming

What is missing:

- Efficient rendering and painting: only on the sub-tree that had state changes
- Smart reconciliation that does work only when needed (on a Fiber's state dispatcher subtree or when props have changed; usage of alternate prop)
- Side effects through `useEffect` hook
- Preserve interactivity states between re-renders (active focus, navigation)

Chore:

- Optimize commit-traversal algorithm
- Improve scheduler through counters (inspired by production React)


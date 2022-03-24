import { React } from "./core/micro-react";

const ClickButton = ({
  label,
  initialValue,
  incrementer,
}: {
  label: string;
  initialValue: number;
  incrementer: (c: number) => number;
}) => {
  const [count, setCount] = React.useState(initialValue);

  const onClickHandler = (ev: MouseEvent) => {
    ev.preventDefault();
    setCount(incrementer);
  };

  return (
    <div style={{ margin: "1rem 0rem" }}>
      {/* We still don't know how to parse onChange, only raw HTMLElement listeners 
            which happen to have lowcased names. 
        @ts-ignore */}
      <button onclick={onClickHandler}>{label}</button>
      <div>{count}</div>
    </div>
  );
};

const PassiveComponent = ({ name }: { name: string }) => {
  return (
    <span>Thank you, {name}, for taking the time to work through this.</span>
  );
};

export default function App() {
  const [text, setText] = React.useState("stranger");

  return (
    <main style={{ width: "100%" }}>
      <h1>Hello, {text}!</h1>
      <form>
        <label>Actually, my name is: </label>
        {/* We still don't know how to parse onChange, only raw HTMLElement listeners 
            which happen to have lowcased names. 
        @ts-ignore */}
        <input onchange={(e) => setText(e.target.value)} />
      </form>
      <div style={{ margin: "2em 0em" }}>
        <ClickButton label="Sum" initialValue={-2} incrementer={(c) => c + 1} />
        <ClickButton
          label="Subtract"
          initialValue={7}
          incrementer={(c) => c - 1}
        />
        <PassiveComponent name={text} />
      </div>
    </main>
  );
}

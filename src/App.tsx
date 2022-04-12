import { React } from "./core/react";

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
      {/* We haven't implemented React's custom event listeners, we need to use
          the ones DOM provides 
        @ts-ignore */}
      <button onclick={onClickHandler}>
        <span>{label}</span>
      </button>
      <div>{count}</div>
    </div>
  );
};

const PassiveComponent = ({ name }: { name: string }) => {
  return (
    <span>Thank you, {name}, for taking the time to work through this.</span>
  );
};

const MyNameIs = ({ setText }: { setText: (t: string) => void }) => {
  return (
    <form>
      <label>Actually, my name is: </label>
      {/* We haven't implemented React's custom event listeners, we need to use
          the ones DOM provides 
        @ts-ignore */}
      <input onchange={(e) => setText(e.target.value)} />
    </form>
  );
};

const AnotherName = () => {
  const [anotherName, setAnotherName] = React.useState("birdie");
  return (
    <div>
      <input
        value={anotherName}
        /* We haven't implemented React's custom event listeners, we need to use
          the ones DOM provides 
        @ts-ignore */
        oninput={(e) => setAnotherName(e.target.value)}
      />
      <span>{anotherName}</span>
    </div>
  );
};

export default function App() {
  const [text, setText] = React.useState("stranger");

  return (
    <main style={{ width: "100%", height: "100%" }}>
      <h1>Hello, {text}!</h1>
      <div>
        <span>
          <p>
            <blockquote>This is a very</blockquote>
            <code>
              <em>
                <b>
                  <span>nested</span>
                  <div>
                    <div>
                      <AnotherName />
                    </div>
                  </div>
                </b>
              </em>
            </code>
          </p>
        </span>
      </div>
      <label>This will change the text above</label>
      <MyNameIs setText={setText} />
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

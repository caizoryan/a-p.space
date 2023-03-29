const Loading: Component = () => {
  const style = `
  .loading{
    background: grey;
    animation: load 400ms ease-in-out infinite;
    height: 40px;
    width: max-content;
color: black;
  }
  @keyframes load{
    0%{
      background: yellow;
      transform: rotate(10deg);
    }
    50%{
      background: black;
      transform: rotate(0deg);
    }
    100%{
      background: yellow;
      transform: rotate(10deg);
    }
  }
`;
  return (
    <div class="loading">
      <style scoped>{style}</style>
      <span style="margin: 30px; font-family: sans-serif;  ">Loading...</span>
    </div>
  );
};

export { Loading };

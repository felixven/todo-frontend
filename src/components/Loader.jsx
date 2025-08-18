import { Grid } from "react-loader-spinner";

const Loader = ({ text, height = "450px", size = 80, color = "#3b82f6" }) => {
  return (
    <div className="flex justify-center items-center w-full" style={{ height }}>
      <div className="flex flex-col items-center gap-1">
        <Grid
          visible={true}
          height={size}
          width={size}
          color={color}
          ariaLabel="grid-loading"
          radius="12.5"
        />
        <p className="text-slate-800">{text ? text : "頁面讀取中..."}</p>
      </div>
    </div>
  );
};

export default Loader;

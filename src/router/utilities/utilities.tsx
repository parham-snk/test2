import toast from "react-hot-toast";
import ReactLoading from "react-loading";
const notify = (msg: string, icon: "error" | "success") => {
    let ico;
    switch (icon) {
        case "error":
            ico = "❌"
            break;
        case "success":
            ico = "✅"
            break;
    }
    toast(msg, {
        style: { background: "rgba(0,0,0,.5)", backdropFilter: "blur(5px)", color: "white", border: "1px solid white", flexDirection: "row-reverse" },
        icon: ico
    });
}




function Loader() {
  return (
    <ReactLoading
      type="spin"
      color="#3b82f6"
      height={60}
      width={60}
    />
  );
}
export {notify,Loader}
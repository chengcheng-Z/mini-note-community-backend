import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-center">
      <h1 className="page-title">页面不存在</h1>
      <Link to="/">回到首页</Link>
    </div>
  );
}

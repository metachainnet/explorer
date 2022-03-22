interface LiveClusterStatItemParam {
  title: string;
  children: any;
}

export default function LiveClusterStatItem({
  title,
  children,
}: LiveClusterStatItemParam) {
  return (
    <div className="col-lg-3 col-md-6 col-sm-6 col-12 position-relative">
      <div className="item">
        <div className="title">
          <div className="icon"></div>
          <h5>{title}</h5>
        </div>
        <div className="text">
          <span>{children}</span>
        </div>
      </div>
    </div>
  );
}

interface StyledTableParam {
  /**
   * 제목과 버튼등이 함께 있을 떄 사용
   */
  cardHeader?: JSX.Element | undefined;
  /**
   * 테이블의 작은 제목을 달 때 사용
   */
  tableCaption?: string | undefined;

  /**
   * 테이블 헤더
   */
  tableHead?: string[] | undefined;

  /**
   * 테이블 내용
   */
  tableBody: JSX.Element | JSX.Element[];
}

function cls(...className: string[]) {
  return className.join(" ");
}

export default function StyledTable({
  cardHeader,
  tableCaption,
  tableHead,
  tableBody,
}: StyledTableParam) {
  return (
    <div className="row m-bottom-70">
      <div className="col-lg-12 col-md-12 col-sm-12">
        {cardHeader ? (
          <div className="card-header align-items-center">{cardHeader}</div>
        ) : null}
        <div className="table-responsive">
          <table
            className={cls(
              "table table-striped table-latests table-detail",
              tableCaption ? "caption-top" : ""
            )}
          >
            {tableCaption ? <caption>{tableCaption}</caption> : null}
            {tableHead ? (
              <thead>
                <tr>
                  {tableHead.map((string, i) => (
                    <th key={i} className="text-muted">
                      {string}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>{tableBody}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

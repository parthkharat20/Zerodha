import React from "react";

const RightSection = ({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) => {
  return (
    <div className="container">
      <div className="row align-items-center" style={{ minHeight: "55vh" }}>
        
        <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
          <h1>{productName}</h1>
          <p className="text-muted" style={{ maxWidth: "420px", lineHeight: "1.7" }}>
            {productDescription}
          </p>

          <div>
            <a
              href={learnMore}
              style={{ textDecoration: "none" }}
            >
              Learn More <i className="fa fa-long-arrow-right"></i>
            </a>
          </div>
        </div>

        <div className="col-md-6 p-5 d-flex align-items-center justify-content-center">
          <img src={imageURL} className="img-fluid" />
        </div>

      </div>
    </div>
  );
};

export default RightSection;

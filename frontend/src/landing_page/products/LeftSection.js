import React from "react";

const LeftSection = ({
  imageURL,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) => {
  return (
    <div className="row">
      <div className="col-6 p-5 d-flex align-items-center justify-content-center">
        <img src={imageURL} />
      </div>
      <div className="col-6 p-5 mt-5">
        <h1>{productName}</h1>
        <p className="text-muted" style={{ maxWidth: "420px" }}>
          {productDescription}
        </p>

        <div>
          <a href={tryDemo} style={{ textDecoration: "none" }}>
            Try Demo <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
          <a
            href={learnMore}
            style={{ marginLeft: "50px", textDecoration: "none" }}
          >
            Learn More <i class="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </div>

        <div className="mt-3">
          <a href={googlePlay}>
            <img src="media/images/googlePlayBadge.svg" />
          </a>
          <a href={appStore}>
            <img
              src="media/images/appstoreBadge.svg"
              style={{ marginLeft: "50px" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;

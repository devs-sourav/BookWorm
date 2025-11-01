import React from "react";
import Containar from "../../layouts/Containar";

const ParagraphtoList = ({ paragraph, classValue, contain }) => {
  return (
    <section
      className={`sm:pb-16 pt-10 xl:pt-10 ${classValue} ? ${classValue} : ""`}
    >
      {contain ? (
        <Containar>
          <h2 className="text-xl  sm:text-3xl font-medium text-texthead mb-2">
            Product Details
          </h2>
          <div
            className="default_behave1"
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        </Containar>
      ) : (
        <>
          <h2 className="text-xl  sm:text-3xl font-medium text-texthead mb-2">
            Product Details
          </h2>
          <div
            className="default_behave1"
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        </>
      )}
    </section>
  );
};

export default ParagraphtoList;

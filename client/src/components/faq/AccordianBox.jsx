import React from "react";
import "./accordian.css";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { IoChevronDownSharp } from "react-icons/io5";
import "@radix-ui/themes/styles.css";
import Containar from "../../layouts/Containar";

const AccordianBox = ({ accordianList, heading }) => {
  return (
    <section className="font-inter mb-20">
      <Containar>
        {heading ? (
          <div className="flex justify-center mb-5">
            <h3 className="w-[800px] text-xl text-texthead font-medium">
              {heading}
            </h3>
          </div>
        ) : (
          ""
        )}

        <div className="flex justify-center ">
          <Accordion.Root
            className="AccordionRoot"
            type="single"
            collapsible
          >
            {accordianList.map((item, index) => (
              <Accordion.Item
                key={index}
                className="AccordionItem"
                value={`item-${index + 1}`}
              >
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.para}</AccordionContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </Containar>
    </section>
  );
};

const AccordionTrigger = React.forwardRef(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="AccordionHeader">
      <Accordion.Trigger
        className={classNames("AccordionTrigger", className)}
        {...props}
        ref={forwardedRef}
      >
        {children}
        <ChevronDownIcon className="AccordionChevron" aria-hidden />
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

const AccordionContent = React.forwardRef(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={classNames("AccordionContent", className)}
      {...props}
      ref={forwardedRef}
    >
      <div className="AccordionContentText">{children}</div>
    </Accordion.Content>
  )
);

export default AccordianBox;

import React from "react";
import * as Select from '@radix-ui/react-select';
import classnames from 'classnames';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setSortOption } from '../../redux/slices/sorSlice';

const SelectOption = () => {
  const dispatch = useDispatch();
  const selectedSortOption = useSelector((state) => state.sort.selectedSortOption);

  const handleSelectChange = (value) => {
    dispatch(setSortOption(value));
  };

  return (
    <>
      <Select.Root className="" onValueChange={handleSelectChange} >
        <Select.Trigger
          className="inline-flex font-inter items-center justify-center rounded px-[15px] text-[14px] leading-none min-w-[120px] h-[40px] gap-[5px] text-texthead border  border-texthead outline-none"
          aria-label="Sort Options"
        >
          <Select.Value className="border-b border-b-border py-3" placeholder="Default sorting" />
          <Select.Icon className="text-violet11">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
            <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-[5px]">
              <Select.Group>
                <SelectItem value="default">Default Sorting</SelectItem>
                {/* <SelectItem value="popularity">Sort by Popularity</SelectItem> */}
                <SelectItem value="latest">Sort by Latest</SelectItem>
                {/* <SelectItem value="discountValue">Sort by Discount</SelectItem> */}
                {/* <SelectItem value="discountValue">Sort by Discoun Percentage</SelectItem> */}
                <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                <SelectItem value="high-to-low">Price: High to Low</SelectItem>
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
};

const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={classnames(
        'text-[13px] leading-none text-texthead rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-danger data-[highlighted]:text-white',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
        <CheckIcon />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

export default SelectOption;

import React from "react";

export const InputGroup = (props) => {
    const { label, type, value, setValue, unit, disabled } = props;

    return (
        <div className="input-group">
            {label && <span>{label}</span>}
            <input type={type} value={value} disabled={disabled} onChange={e => setValue(e.target.value)} />
            {unit && <span>{unit}</span>}
        </div>
    );
}

export const CheckGroup = (props) => {
    const { label, type, value, setValue, unit, disabled } = props;

    return (
        <div className="input-group">
            {label && <span>{label}</span>}
            <input type={type} checked={value} disabled={disabled} onChange={e => setValue(e.target.checked)} />
            {unit && <span>{unit}</span>}
        </div>
    );
}

export const SelectGroup = (props) => {
    const { label, options, value, setValue, unit, disabled } = props;

    return (
        <div className="select-group">
            {label && <span>{label}</span>}
            <select value={value} disabled={disabled} onChange={e => setValue(e.target.value)}>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {unit && <span>{unit}</span>}
        </div>
    );
}

export const ColorPicker = (props) => {
  const { label, value, setValue, disabled } = props;

  return (
      <div className="color-picker">
          {label && <span>{label}</span>}
          <input type="color" value={value} disabled={disabled} onChange={e => setValue(e.target.value)} />
      </div>
  );
}

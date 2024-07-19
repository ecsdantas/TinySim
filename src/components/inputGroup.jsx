import React from "react"

export const InputGroup = (props) => {

    const {label, type, value, setValue, unit, disabled} = props

    return (
        <div className="input-group">
                { label && <span>{ label }</span> }
                <input type={ type } value={ value } disabled={ disabled } onChange={ e => setValue(Number(e.target.value))}/>
                { unit && <span>{ unit }</span> }
        </div>
    )

}

export const SelectGroup = (props) => {
    const { label, options, value, setValue, unit, disabled } = props;
  
    return (
      <div className="select-group">
        {label && <span>{label}</span>}
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {unit && <span>{unit}</span>}
      </div>
    );
  };
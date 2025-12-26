import React from "react";

interface HiddenFieldProps {
    field: {
        fieldName: string;
        defaultValue?: string;
        [key: string]: any;
    };
    value: string;
}

const HiddenField: React.FC<HiddenFieldProps> = ({ field, value }) => (
    <input key={field.fieldName} type="hidden" value={field.defaultValue || value} />
);

export default HiddenField;

import { formatCurrency } from "./formateCurrency";

export type TypeValue  = 'Point' | 'Value' | 'Others';

interface IFormatDefaultValueReturn {
  TypeValue?: TypeValue;
  Value?: number;

}

export function formatDefaultValueReturn({ TypeValue, Value }: IFormatDefaultValueReturn) {
    if (TypeValue === 'Point') {
        return Value
    }
    if (TypeValue === 'Value') {
        return  formatCurrency(Value)
    }
    if (TypeValue === 'Others') {
        return Value
    }
    return  Value
  
}
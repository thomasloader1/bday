import React, {FC, ReactNode} from 'react';

interface Props{
    children: ReactNode;
    delay?: number;
}

const FadeUp: FC<Props>= ({children, delay}) => {
    const delayClass:any = {
        0:`animate-delay-[500ms]`,
        1:`animate-delay-[1000ms]`,
        2:`animate-delay-[2000ms]`,
        3:`animate-delay-[3000ms]`,
        4:`animate-delay-[4000ms]`,
}
    return (<div className={`animate-fade-up ${delayClass[delay ?? 0]}`}>
            {children}
        </div>
    )
}

export default FadeUp;
import React from "react";

const CARD_STYLE: React.CSSProperties = {
	borderRadius: 20,
	overflow: "hidden",
};

interface Props {
	style?: React.CSSProperties;
}

export default function ChromaBlock({ style }: Props) {
	return (
		<div
			className='shadow-md'
			style={{
				...CARD_STYLE,
				border: "1px solid #00FF00",
				background: "#00FF00",
				...style,
			}}
		/>
	);
}

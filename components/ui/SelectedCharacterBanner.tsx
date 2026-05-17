const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

function titleImg(plateName: string) {
	return `${SF6_BASE}/material/title_s/${plateName}.png`;
}

interface Props {
	plateName: string;
	value: string;
	className?: string;
}

export default function SelectedCharacterBanner({
	plateName,
	value,
	className,
}: Props) {
	return (
		<div
			id='selected-character-banner'
			className={`relative sm:h-10 sm:w-80 h-5 w-40 flex justify-center align- text-center flex-col text-xs text-base-content/60 ${className ?? ""}`}
			style={{
				backgroundSize: "cover",
				backgroundImage: `url(${titleImg(plateName)})`,
			}}>
			{value}
		</div>
	);
}

type DashboardListItemProps = {
  label: string;
  link: string;
};

export default function DashboardListItem({ label, link }: DashboardListItemProps) {
  return (
    <a 
      href={link}
      className="
        block 
        bg-gray-100 
        hover:bg-gray-200 
        transition 
        p-3 
        rounded-md 
        text-sm 
        text-gray-800 
        shadow-sm
        border 
        border-gray-300
      "
    >
      {label}
    </a>
  );
}

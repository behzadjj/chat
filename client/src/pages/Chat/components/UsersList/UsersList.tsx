import { FC } from "react";

type Props = {
  list: Array<{ userId: string; name: string }>;
};

export const UsersList: FC<Props> = ({ list }) => {
  console.log(list);
  return <>users list works</>;
};

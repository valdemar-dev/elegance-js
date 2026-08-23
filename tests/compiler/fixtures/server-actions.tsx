const save = serverAction({
    callback: async (data: any) => {
        console.log(data);
    },
});

export default function Page() {
    return <button onClick={() => save({ text: "hi" })}>Save</button>;
}

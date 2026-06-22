export default async function Layout({ child: Child }: { child: () => Promise<VirtualNode> }) {
    return <div>
        <Child/>
    </div>
}
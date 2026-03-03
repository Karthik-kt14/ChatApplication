const chats=[
    {
    isGroupChat: false,
    users: [
        {
            name: "Karthik Teja",
            email: "karthikteja@example.com"
        },
        {
            name: "John Doe",
            email: "johndoe@example.com"
        },
    ],
    _id: "617a077e18a3d3365f8b4567",
    chatName: "Karthik Teja",
},{
    isGroupChat: true,
    users: [
        {
            name: "Karthik Teja",
            email: "karthikteja@example.com"
        },
        {
            name: "John Doe",
            email: "johndoe@example.com"
        },
        {
            name: "Jane Smith",
            email: "janesmith@example.com"
        }
    ],
    _id: "617a077e18a3d3365f8b4568",
    chatName: "Team Alpha"
}]
module.exports={chats};
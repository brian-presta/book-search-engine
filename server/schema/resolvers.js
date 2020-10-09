const { User } = require('../models')
const { AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils/auth')

function checkLoggedIn(user) {
    if (user) {
        return 
    }
    throw new AuthenticationError("You aren't logged in!")
}

const resolvers = {
    Query: {
        me: async (parent, args, { user }) => {
            checkLoggedIn(user)
            try {
                const foundUser = await User.findOne({_id: user.id})
                    .select('-__v -password')
                    .populate('savedBooks')
                    return foundUser
            }
            catch(err) {
                console.log(err)
            }
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token, user}
        },
        login: async (parent, { email, password}) => {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new AuthenticationError(("Credentials invalid!"))
                }
                const correctPassword = await user.isCorrectPassword(password)
                if (!correctPassword) {
                    throw new AuthenticationError(("Credentials invalid!"))
                }
                const token = signToken(user)
                return { token, user}

            }
            catch(err) {
                console.log(err)
            }
        },
        saveBook: async (parent, args, { user }) => {
            checkLoggedIn(user)
            try {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: user.id},
                    {$addToSet: {...args}},
                    {new: true}
                ).populate('savedBooks')
                return updatedUser
            }
            catch(err) {
                console.log(err)
            }
        },
        removeBook: async(parent, { bookId }, { user }) => {
            checkLoggedIn(user)
            try {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: user.id},
                    {$pull: {bookId}},
                    {new: true}
                ).populate('savedBooks')
                return updatedUser
            }
            catch(err) {
                console.log(err)
            }
        },
    }
}

module.exports = resolvers
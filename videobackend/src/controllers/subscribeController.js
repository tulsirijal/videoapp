
import prisma from "../db/prisma.js";
import { sendNotification } from "../services/notificationEmitter.js";
import { getIo } from "../services/socketStore.js";

const subscribe = async (req, res) => {
  try {
    const io = getIo();
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "user must be logged in" });
    }
    const channelId = parseInt(req.params.channelId);
    console.log(channelId);
    // check if already subscribed
    const alreadySubscribed = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId: user.id,
          subscribedToId: channelId,
        },
      },
    });
    if (alreadySubscribed) {
      await prisma.subscription.delete({
        where: {
          subscriberId_subscribedToId: {
            subscriberId: user.id,
            subscribedToId: channelId,
          },
        },
      });

      const subscriptionCount = await prisma.subscription.count({
        where: {
          subscribedToId: channelId,
        },
      });

      io.to(`channel_${channelId}`).emit("update_sub_count", {
        channelId: channelId,
        subscriptionCount: subscriptionCount,
      });
      
      return res.status(200).json({ message: "unsubscribed." });
    } else {
      await prisma.subscription.create({
        data: {
          subscriberId: user.id,
          subscribedToId: channelId,
        },
      });

      const subscriptionCount = await prisma.subscription.count({
        where: {
          subscribedToId: channelId,
        },
      });

      io.to(`channel_${channelId}`).emit("update_sub_count", {
        channelId: channelId,
        subscriptionCount: subscriptionCount,
      });

      if (channelId != user.id) {
        await sendNotification({
          receiverId: channelId,
          senderId: user.id,
          type: "SUBSCRIBE",
        });
      }

      return res.status(200).json({ message: "subscribed." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId);
    const subscribers = await prisma.subscription.findMany({
      where: {
        subscribedToId: channelId,
      },
      include: { subscriber: true },
    });
    return res.status(200).json({ subscribers });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
      },
      include: { subscribedTo: true },
    });
    return res.status(200).json({ subscriptions });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const isSubscribed = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const channelId = parseInt(req.body.channelId);
    const subscribedOrNot = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId: userId,
          subscribedToId: channelId,
        },
      },
    });
    if (subscribedOrNot) {
      return res.status(200).json({ subscribed: true, subscribedOrNot });
    } else {
      return res.status(200).json({ subscribed: false, subscribedOrNot });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error });
  }
};
export { getAllSubscribers, isSubscribed, getAllSubscriptions };
export default subscribe;
